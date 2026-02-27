import { useState } from "react";
import Editor from "@monaco-editor/react";
import {
  SendIcon,
  Code2Icon,
  ChevronDownIcon,
  ChevronUpIcon,
  ZapIcon,
  CheckCircleIcon,
} from "lucide-react";

const TEMPLATE_PROMPTS = [
  {
    label: "Function Signature",
    code: `// Complete this function:\nfunction solution(/* params */) {\n  // Your code here\n}`,
  },
  {
    label: "Fix the Bug",
    code: `// Find and fix the bug in this code:\nfunction buggyFn(arr) {\n  for (let i = 0; i <= arr.length; i++) {\n    console.log(arr[i]);\n  }\n}`,
  },
  {
    label: "Optimize This",
    code: `// Optimize the time complexity of this solution:\nfunction hasDuplicate(arr) {\n  for (let i = 0; i < arr.length; i++)\n    for (let j = i + 1; j < arr.length; j++)\n      if (arr[i] === arr[j]) return true;\n  return false;\n}`,
  },
];

function InterviewerCodePanel({ isHost, onSubmitCode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [promptCode, setPromptCode] = useState("// Write the code task for the interviewee here\n");
  const [instructions, setInstructions] = useState("");
  const [submitted, setSubmitted] = useState(false);

  if (!isHost) return null;

  const handleSubmit = () => {
    if (!promptCode.trim()) return;
    onSubmitCode({ code: promptCode, instructions });
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <div className="border-t-2 border-primary/30 bg-base-100">
      {/* Toggle Header */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-base-200 transition-colors"
      >
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-br from-primary to-secondary rounded-lg">
            <Code2Icon className="size-4 text-white" />
          </div>
          <span className="font-bold text-sm">Interviewer Code Prompt</span>
          <span className="badge badge-primary badge-sm">Host Only</span>
        </div>
        {isOpen ? (
          <ChevronUpIcon className="size-4 text-base-content/60" />
        ) : (
          <ChevronDownIcon className="size-4 text-base-content/60" />
        )}
      </button>

      {isOpen && (
        <div className="p-4 space-y-3 bg-base-200 border-t border-base-300">
          {/* Quick Templates */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-semibold text-base-content/60 uppercase tracking-wider">
              Templates:
            </span>
            {TEMPLATE_PROMPTS.map((t) => (
              <button
                key={t.label}
                onClick={() => setPromptCode(t.code)}
                className="btn btn-xs btn-outline btn-primary"
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Instructions input */}
          <div>
            <label className="label py-1">
              <span className="label-text text-xs font-semibold">Instructions (optional)</span>
            </label>
            <input
              type="text"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              placeholder="e.g. Solve this in O(n) time complexity..."
              className="input input-sm w-full input-bordered bg-base-100"
            />
          </div>

          {/* Code Editor */}
          <div className="rounded-xl overflow-hidden border-2 border-base-300 shadow-inner">
            <div className="bg-[#1e1e1e] px-3 py-1.5 flex items-center gap-2 border-b border-base-300">
              <div className="flex gap-1.5">
                <div className="size-3 rounded-full bg-red-500/70" />
                <div className="size-3 rounded-full bg-yellow-500/70" />
                <div className="size-3 rounded-full bg-green-500/70" />
              </div>
              <span className="text-xs text-white/40 font-mono ml-1">prompt.js</span>
            </div>
            <Editor
              height="180px"
              language="javascript"
              value={promptCode}
              onChange={(val) => setPromptCode(val || "")}
              theme="vs-dark"
              options={{
                fontSize: 13,
                lineNumbers: "on",
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                automaticLayout: true,
                padding: { top: 8, bottom: 8 },
              }}
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!promptCode.trim()}
            className={`btn btn-sm w-full gap-2 ${
              submitted ? "btn-success" : "btn-primary"
            } transition-all`}
          >
            {submitted ? (
              <>
                <CheckCircleIcon className="size-4" />
                Sent to Interviewee!
              </>
            ) : (
              <>
                <ZapIcon className="size-4" />
                Push to Interviewee Editor
              </>
            )}
          </button>
        </div>
      )}
    </div>
  );
}

export default InterviewerCodePanel;