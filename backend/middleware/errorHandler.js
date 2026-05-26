const errorHandler = (err, req, res, next) => {
    console.error('Erro no servidor:', err.message || err);

    const statusCode = err.statusCode || 500;
    const errorMessage = err.message || 'Erro interno do servidor';

    res.status(statusCode).json({
        success: false,
        error: errorMessage
    });
};

module.exports = errorHandler;
