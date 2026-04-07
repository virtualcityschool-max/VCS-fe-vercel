import React from "react";

const PasswordValidation = ({ password }) => {
  const validations = [
    {
      test: password.length >= 8,
      label: "At least 8 characters",
    },
    {
      test: /[A-Z]/.test(password),
      label: "One uppercase letter",
    },
    {
      test: /[a-z]/.test(password),
      label: "One lowercase letter",
    },
    {
      test: /[0-9]/.test(password),
      label: "One number",
    },
    {
      test: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password),
      label: "One special character",
    },
  ];

  return (
    <div className="mt-2 space-y-1">
      {validations.map((validation, index) => (
        <div
          key={index}
          className={`flex items-center gap-2 text-xs ${
            validation.test ? "text-green-400" : "text-slate-500"
          }`}
        >
          <i
            className={`fas ${
              validation.test ? "fa-check-circle" : "fa-circle"
            } text-[8px]`}
          ></i>
          {validation.label}
        </div>
      ))}
    </div>
  );
};

export default PasswordValidation;
