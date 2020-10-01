const setHeaders = (req: any, res: any, next: any) => {
    res.set({
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': '*'
    });
    next();
};

export {
    setHeaders
}
