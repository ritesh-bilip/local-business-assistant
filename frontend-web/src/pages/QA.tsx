import QAConsole from "../components/QAConsole";

export default function QA() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Ask</h1>
        <p className="text-gray-500">Answers grounded in your uploaded documents.</p>
      </div>
      <QAConsole />
    </div>
  );
}