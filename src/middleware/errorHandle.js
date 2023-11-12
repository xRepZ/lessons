import { ApiError } from "../error/ApiError.js"

export const errorHandler = (err, req, resp, next) => {
    if (err instanceof ApiError) {
        return resp.status(err.status).json({message: err.message})
    }
    return resp.status(500).json({message: "unexpected error"})
}