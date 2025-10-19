import { SubmissionForm } from "../SubmissionForm";

export default function SubmissionFormExample() {
  return (
    <div className="p-8 max-w-4xl">
      <SubmissionForm 
        onSubmit={(items) => console.log("Submitted:", items)}
        isLoading={false}
      />
    </div>
  );
}
