import React from "react";
import { ONSLoadingPanel, ONSPanel } from "blaise-design-system-react-components";
import { AsyncState, hasErrored, isLoading } from "../hooks/useAsyncRequest";

interface AsyncContentProps<T> {
  content: AsyncState<T>;
  children: (content: T) => React.ReactNode;
}

export default function AsyncContent<T>({ content, children }: AsyncContentProps<T>) {
    if (isLoading(content)) {
        return <ONSLoadingPanel />;
    }

    if (hasErrored(content)) {
        return <ONSPanel status="error">{content.error}</ONSPanel>;
    }

    return <>{children(content.data)}</>;
}