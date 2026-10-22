export default function JSONObjectParser(value) {
    let object = JSON.stringify(value, replacer())
    return `${object}`;
}

function replacer(key, value) {
    if (typeof value === "string") {
        return undefined;
    }
    return value;
}