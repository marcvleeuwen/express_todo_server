module.exports = {
    formatListItems: function (list, items, categories) {
        let response = {
            title: list[0].title,
            description: list[0].description,
            categories,
            items
        }

        return response;
    },
    removeTrailingCharacters: function (str, chars) {
        if (str.substr(str.length - chars.length, chars.length) === chars) {
            return str.substr(0, str.length - chars.length);
        } else {
            return str;
        }
    }
}