exports.filterMapper = (body) => {
    const { search, search_by } = body; //getting search 

    const searchByArr = search_by?.split(',');
    let filter = {};

    if (searchByArr?.length > 1) { //for multiple filters
        let conditions = [];
        searchByArr?.map((f) => {
            if(f?.split('.').length < 2){
                return conditions.push({ [f]: { $regex: search,  $options: 'i' } })
            }
        });

        filter = { $or: conditions };

    } else {
        let searchBy = search_by?.split('.').length;
        if (searchBy < 2) {
            // filter: { 'menu_items': { name: { '$regex': 'Chicken Biryani' } } }
            filter = { [search_by]: { $regex: search,  $options: 'i' } };
        }
    }

    return filter;
}