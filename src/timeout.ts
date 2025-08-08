class InternalTimeout {}

export const timeout: <T>(millis: number | "INFINITELY", f: (done: () => boolean) => Promise<T>) => Promise<T> = async (millies, f) => {
    if (millies === "INFINITELY"){
        return f(() => false)
    }

    let done = false;
    const doneF = () => done;

    let timeoutRef;
    let result;

    try {
        result = await Promise.race([
            f(doneF),

            new Promise<InternalTimeout>((resolve) => {
                timeoutRef = setTimeout(() => {
                    done = true
                    resolve(new InternalTimeout())
                }, millies)
            }),
        ]);
    } catch (err) {
        clearTimeout(timeoutRef);
        throw err;
    }

    if (result instanceof InternalTimeout) {
        throw new Error(`Timeout after ${millies}ms`);
    }

    clearTimeout(timeoutRef);

    return result;
};
