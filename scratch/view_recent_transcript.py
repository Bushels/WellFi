import json
import os

transcript_path = r"C:\Users\kyle\.gemini\antigravity\brain\17c9e506-d341-4e2e-b458-9261ef84ebc1\.system_generated\logs\transcript.jsonl"

if not os.path.exists(transcript_path):
    print("Transcript not found at", transcript_path)
else:
    with open(transcript_path, 'r', encoding='utf-8') as f:
        lines = f.readlines()
        print(f"Total lines: {len(lines)}")
        for line in lines[-50:]:
            try:
                obj = json.loads(line)
                step = obj.get("step_index", "?")
                source = obj.get("source", "?")
                type_ = obj.get("type", "?")
                content = obj.get("content", "")
                if content:
                    # truncate content for readability
                    content_preview = content[:200].replace('\n', ' ')
                    print(f"Step {step} | Source: {source} | Type: {type_} | Content: {content_preview}")
            except Exception as e:
                print("Error parsing line:", e)
