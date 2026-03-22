export function sendResponse(res, payload) {
    const body = {
        success: payload.success ?? true,
        message: payload.message,
        data: payload.data,
        meta: payload.meta,
        errors: payload.errors,
    };
    return res.json(body);
}
