

export class ApiError extends Error{
    constructor(status, message){
        super()
        this.status = status
        this.message = message
    }
    static badRequest(message) {
        return new ApiError(400, message)
    }
    static notFound(message) {
        return new ApiError(404, message)
    }
    static methodNotAllowed(message) {
        return new ApiError(405, message)
    }
    static serverError(message) {
        return new ApiError(500, message)
    }
}

