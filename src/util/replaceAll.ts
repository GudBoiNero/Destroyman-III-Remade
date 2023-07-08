export function replaceAll(
    string: string,
    searchString: string,
    replaceString: string
): string {
    // While string has searchValue- call String.replace
    while (string.includes(searchString)) {
        string = string.replace(searchString, replaceString);
    }
    return string;
}
export function replaceAllInList(
    string: string,
    searchList: string[],
    replaceString: string
): string {
    // For all in searchList replaceAll
    for (let index = 0, length = searchList.length; index < length; index++) {
        string = module.exports.replaceAll(
            string,
            searchList[index],
            replaceString
        );
    }
    return string;
}
