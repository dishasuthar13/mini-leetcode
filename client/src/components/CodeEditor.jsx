import Editor from '@monaco-editor/react';

const CodeEditor = ({ language, code, onChange }) => {
  return (
    <Editor
      height="500px"
      language={language}
      value={code}
      onChange={(value) => onChange(value ?? '')}
      theme="vs-dark"
      options={{
        fontSize: 14,
        minimap: { enabled: false },
        automaticLayout: true,
      }}
    />
  );
};

export default CodeEditor;