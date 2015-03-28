function binarySearch(values, target, start, end) {
    if (start > end) {
        return null;
    } //does not exist

    var middle = Math.floor((start + end) / 2);
    var value = values[middle];

    if (value.getID() > target) {
        return binarySearch(values, target, start, middle - 1);
    }
    if (value.getID() < target) {
        return binarySearch(values, target, middle + 1, end);
    }
    return value; //found!
}