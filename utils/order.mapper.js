exports.orderMapper = (body) => {
    const { sort_by, sort_order } = body;

    const sortBy = sort_by ? sort_by : "createdAt";
    const sortOrder = sort_order ? sort_order : "desc";
    return { [sortBy]: sortOrder };
}