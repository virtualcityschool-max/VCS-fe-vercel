import React from "react";
import Button from "./Button";

const EmptyState = ({
  icon = "fas fa-inbox",
  title = "No data found",
  description = "There are no items to display at this time.",
  action = null,
  className = "",
  variant = "default",
}) => {
  const variants = {
    default: "text-center py-12",
    compact: "text-center py-6",
    inline: "text-center py-4",
  };

  const iconColors = {
    default: "text-indigo-400",
    compact: "text-indigo-400",
    inline: "text-slate-300",
  };

  return (
    <div className={`${variants[variant]} ${className} animate-scaleIn`}>
      <div className="inline-flex items-center justify-center w-16 h-16 icon-chip rounded-2xl mb-4">
        <i className={`${icon} ${iconColors[variant]} text-2xl`}></i>
      </div>

      <h3 className="text-lg font-bold text-white mb-2">{title}</h3>
      <p className="text-slate-400 mb-6 max-w-sm mx-auto text-sm">{description}</p>

      {action && (
        <div className="flex justify-center">
          <Button
            variant={action.variant || "primary"}
            size={action.size || "md"}
            onClick={action.onClick}
            className={action.className}
          >
            {action.icon && <i className={`${action.icon} mr-2`}></i>}
            {action.label}
          </Button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
