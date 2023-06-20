const generateAccountNumber = () => {
    var min = Math.pow(10, 9);
    var max = Math.pow(10, 10) - 1;
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = generateAccountNumber;