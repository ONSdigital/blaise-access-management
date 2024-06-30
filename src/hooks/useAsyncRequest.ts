import { useEffect, useState } from "react";

type Loading = {
  state: "loading";
};

type Errored = {
  error: string;
  state: "errored";
};

type Succeeded<T> = {
  data: T;
  state: "succeeded";
};

export type AsyncState<T> = Loading | Errored | Succeeded<T>;

export function isLoading<T>(state: AsyncState<T>): state is Loading {
    return state.state === "loading";
}

export function hasErrored<T>(state: AsyncState<T>): state is Errored {
    return state.state === "errored";
}

function loading(): Loading {
    return { state: "loading" };
}

function errored(error: string): Errored {
    return { state: "errored", error };
}

function succeeded<T>(data: T): Succeeded<T> {
    return { state: "succeeded", data };
}

export function useAsyncRequest<T>(request: () => Promise<T>) {
    const [state, setState] = useState<AsyncState<T>>(loading());

    useEffect(() => {
        setState(loading());
        request()
            .then((response) => setState(succeeded(response)))
            .catch((error) => setState(errored(error.message)));
    }, []);

    return state;
}