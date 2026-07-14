import React from "react";

const passthrough = (props: { children?: React.ReactNode }) =>
  React.createElement("div", null, props.children);

const Button = (props: { label?: string; submit?: boolean; onClick?: () => void }) =>
  React.createElement(
    "button",
    { type: props.submit ? "submit" : "button", onClick: props.onClick },
    props.label ?? "Button",
  );

const PasswordInput = (props: {
  label: string;
  id: string;
  value?: string;
  autoFocus?: boolean;
  onChange?: (event: { target: { value: string } }, value: string) => void;
}) =>
  React.createElement(
    "div",
    null,
    React.createElement("label", { htmlFor: props.id }, props.label),
    React.createElement("input", {
      id: props.id,
      type: "password",
      value: props.value ?? "",
      autoFocus: props.autoFocus,
      onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
        props.onChange?.({ target: { value: event.target.value } }, event.target.value),
    }),
  );

const TextInput = (props: {
  label?: string;
  id?: string;
  value?: string;
  onChange?: (event: { target: { value: string } }, value: string) => void;
}) =>
  React.createElement(
    "div",
    null,
    props.label ? React.createElement("label", { htmlFor: props.id }, props.label) : null,
    React.createElement("input", {
      id: props.id,
      type: "text",
      value: props.value ?? "",
      onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
        props.onChange?.({ target: { value: event.target.value } }, event.target.value),
    }),
  );

const Select = (props: {
  id?: string;
  label?: string;
  name?: string;
  value?: string;
  options: Array<{ label: string; value: string }>;
  onChange?: (event: { target: { value: string } }) => void;
}) =>
  React.createElement(
    "div",
    null,
    props.label ? React.createElement("label", { htmlFor: props.id }, props.label) : null,
    React.createElement(
      "select",
      {
        id: props.id,
        name: props.name,
        value: props.value ?? "",
        onChange: (event: React.ChangeEvent<HTMLSelectElement>) =>
          props.onChange?.({ target: { value: event.target.value } }),
      },
      React.createElement(
        "option",
        {
          value: "",
          disabled: true,
        },
        "Select an option",
      ),
      props.options.map((option) =>
        React.createElement("option", { key: option.value, value: option.value }, option.label),
      ),
    ),
  );

const Upload = (props: {
  id?: string;
  label: string;
  description: string;
  accept: string;
  onChange?: (event: React.ChangeEvent<HTMLInputElement>, value: string) => void;
}) =>
  React.createElement(
    "div",
    null,
    React.createElement("label", { htmlFor: props.id }, props.label),
    React.createElement("span", null, props.description),
    React.createElement("input", {
      id: props.id,
      type: "file",
      accept: props.accept,
      onChange: (event: React.ChangeEvent<HTMLInputElement>) =>
        props.onChange?.(event, event.target.value),
    }),
  );

const Table = (props: { children?: React.ReactNode }) =>
  React.createElement("table", null, React.createElement("tbody", null, props.children));

const Panel = (props: {
  children?: React.ReactNode;
  hidden?: boolean;
  id?: string;
  status?: "success" | "error" | "info" | "warn";
}) => {
  if (props.hidden) {
    return null;
  }

  const className = `ons-panel ons-panel--${props.status ?? "info"}`;

  return React.createElement(
    "div",
    { className, "data-testid": props.id ? `${props.id}-panel` : undefined },
    props.children,
  );
};

const LoadingPanel = () => React.createElement("div", null, "Loading");
const ErrorPanel = () =>
  React.createElement(
    "div",
    null,
    "Sorry, there is a problem with this service. We are working to fix the problem. Please try again later.",
  );

const Header = (props: {
  title?: string;
  navigationLinks?: Array<{ id: string; label: string; endpoint: string }>;
  createNavLink?: (id: string, label: string, endpoint: string) => React.ReactNode;
}) =>
  React.createElement(
    "header",
    null,
    React.createElement("h1", null, props.title),
    React.createElement(
      "nav",
      null,
      props.navigationLinks?.map((link) =>
        React.createElement(
          "span",
          { key: link.id },
          props.createNavLink
            ? props.createNavLink(link.id, link.label, link.endpoint)
            : link.label,
        ),
      ),
    ),
  );

const Footer = () => React.createElement("footer", null, "Footer");
const BetaBanner = () => React.createElement("div", null, "Beta");
const NotProductionWarning = () => React.createElement("div", null, "Not production");
const ErrorBoundary = passthrough;
const DefaultErrorBoundary = passthrough;
const Collapsible = passthrough;

export function createDesignSystemMockModule() {
  return {
    BetaBanner,
    Collapsible,
    DefaultErrorBoundary,
    ErrorBoundary,
    Footer,
    Header,
    NotProductionWarning,
    Button,
    ErrorPanel,
    LoadingPanel,
    Panel,
    PasswordInput,
    Select,
    Table,
    TextInput,
    Upload,
  };
}
