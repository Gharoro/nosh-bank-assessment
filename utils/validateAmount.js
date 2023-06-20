const validateAmount = (number) => {
    const decimalPart = number.toString().split('.')[1];
    return decimalPart && decimalPart.length > 2;
}

module.exports = validateAmount;
