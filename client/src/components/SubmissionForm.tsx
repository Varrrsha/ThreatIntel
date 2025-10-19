import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Upload, Search, X } from "lucide-react";
import { Card } from "@/components/ui/card";

interface SubmissionFormProps {
  onSubmit: (items: string[]) => void;
  isLoading?: boolean;
}

export function SubmissionForm({ onSubmit, isLoading = false }: SubmissionFormProps) {
  const [input, setInput] = useState("");
  const [errors, setErrors] = useState<string[]>([]);

  const validateInput = (text: string): { valid: string[]; invalid: string[] } => {
    const lines = text.split(/[\n,]/).map(line => line.trim()).filter(Boolean);
    const valid: string[] = [];
    const invalid: string[] = [];

    const hashRegex = /^[a-fA-F0-9]{32}$|^[a-fA-F0-9]{40}$|^[a-fA-F0-9]{64}$/;
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

    lines.forEach(line => {
      if (hashRegex.test(line) || ipRegex.test(line)) {
        valid.push(line);
      } else {
        invalid.push(line);
      }
    });

    return { valid, invalid };
  };

  const handleInputChange = (value: string) => {
    setInput(value);
    const { invalid } = validateInput(value);
    setErrors(invalid);
  };

  const handleSubmit = () => {
    const { valid } = validateInput(input);
    if (valid.length > 0) {
      onSubmit(valid);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result as string;
        handleInputChange(content);
      };
      reader.readAsText(file);
    }
  };

  const handleClear = () => {
    setInput("");
    setErrors([]);
  };

  const { valid } = validateInput(input);

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Submit Indicators</h2>
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept=".txt,.csv"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
              data-testid="input-file-upload"
            />
            <Button
              variant="outline"
              size="sm"
              onClick={() => document.getElementById("file-upload")?.click()}
              data-testid="button-upload-file"
            >
              <Upload className="h-4 w-4 mr-2" />
              Upload CSV
            </Button>
            {input && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                data-testid="button-clear"
              >
                <X className="h-4 w-4 mr-2" />
                Clear
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Textarea
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder="Enter hashes (MD5, SHA1, SHA256) or IP addresses&#10;One per line or comma-separated&#10;&#10;Example (known malware hash):&#10;275a021bbfb6489e54d471899f7db9d1663fc695ec2fe2a2c4538aabf651fd0f&#10;&#10;Example (clean hash):&#10;e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855&#10;&#10;Note: Free VirusTotal API allows 4 requests per minute"
            className="font-mono text-sm min-h-48 resize-none"
            data-testid="input-indicators"
          />
          {errors.length > 0 && (
            <div className="text-sm text-destructive">
              {errors.length} invalid {errors.length === 1 ? "entry" : "entries"} detected
            </div>
          )}
          {valid.length > 0 && (
            <div className="text-sm text-muted-foreground">
              {valid.length} valid {valid.length === 1 ? "indicator" : "indicators"} ready to scan
            </div>
          )}
        </div>

        <Button
          className="w-full"
          size="lg"
          onClick={handleSubmit}
          disabled={valid.length === 0 || isLoading}
          data-testid="button-scan"
        >
          <Search className="h-5 w-5 mr-2" />
          {isLoading ? "Scanning..." : `Scan ${valid.length || ""} Indicator${valid.length !== 1 ? "s" : ""}`}
        </Button>
      </div>
    </Card>
  );
}
