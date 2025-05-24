import json
import re
import os
import time
from openai import OpenAI
from dotenv import load_dotenv
from ..tools.search_tools import TOOL_MAPPING

class AIAgent:
    def __init__(self, model: str = None, tools=None, endpoint: str = "https://openrouter.ai/api/v1", system_prompt: str = None, is_chat_agent: bool = False):
        load_dotenv()
        self.model = model
        self.system_prompt = system_prompt
        self.tools = tools
        self.is_chat_agent = is_chat_agent
        self.client = OpenAI(base_url=endpoint, api_key=os.getenv("OPENROUTER_API_KEY"))
        self.base_history = [{"role": "system", "content": system_prompt}]
        self.history = self.base_history.copy()
        
    def text_response(self, user_prompt, context_info=None):
        if context_info:
            enhanced_prompt = f"{user_prompt}\n\n컨텍스트 정보: {context_info}"
        else:
            enhanced_prompt = user_prompt
            
        self.history.append({"role": "user", "content": enhanced_prompt})
        
        if len(self.history) > 10:
            self.history = [self.history[0]] + self.history[-8:]
        
        params = {
            "model": self.model,
            "messages": self.history,
            "stream": True,
        }
        
        if self.tools:
            params["tools"] = self.tools
            params["tool_choice"] = "auto"
        
        response = self.client.chat.completions.create(**params)
        
        final_response = ""
        function_name = ""
        function_args = ""
        json_buffer = ""
        
        for chunk in response:
            delta = chunk.choices[0].delta
            
            if delta.content:
                print(delta.content, end="", flush=True)
                final_response += delta.content
                
            elif delta.tool_calls:
                tool_call = delta.tool_calls[0]
                
                if tool_call.function.name:
                    function_name += tool_call.function.name
                    print(f"\nAction: {tool_call.function.name}", end="", flush=True)
                    
                if tool_call.function.arguments:
                    json_buffer += tool_call.function.arguments
                    print(tool_call.function.arguments, end="", flush=True)
                    
                    if json_buffer.count('{') == json_buffer.count('}') and json_buffer.count('{') > 0:
                        function_args = json_buffer
                        json_buffer = ""
        
        if final_response:
            self.history.append({"role": "assistant", "content": final_response})
            return final_response
        elif function_name:
            return (function_name, function_args)
        else:
            return ""

    def get_tool_response(self, *args):
        if len(args) != 2:
            return "도구 호출 오류"
            
        tool_name = args[0]
        raw_args = args[1]
        
        # JSON 유효성 검사 강화
        try:
            tool_args = json.loads(raw_args)
        except json.JSONDecodeError:
            last_brace = raw_args.rfind('}')
            if last_brace != -1:
                try:
                    tool_args = json.loads(raw_args[:last_brace+1])
                except:
                    match = re.search(r'"query":\s*"([^"]*)"', raw_args)
                    if match:
                        tool_args = {"query": match.group(1)}
                    else:
                        tool_args = {"query": raw_args}
            else:
                tool_args = {"query": raw_args}
        
        tool_result = TOOL_MAPPING[tool_name](**tool_args)
        
        print(f"\nObservation: 검색 결과를 받았습니다.")
        print(f"Thought: 검색 결과를 바탕으로 최종 답변을 제공하겠습니다.")
        print(f"Final Answer: ")
        
        self.history.append({
            "role": "assistant", 
            "content": f"검색 결과: {tool_result[:500]}..."
        })
        
        return tool_result 