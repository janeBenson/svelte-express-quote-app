function sortArrayByName(array) {
  const copyArray = [...array]

  // sort by name
  copyArray.sort(function (a, b) {
    let nameA = a.name.toUpperCase() // ignore upper and lowercase
    let nameB = b.name.toUpperCase() // ignore upper and lowercase
    if (nameA < nameB) {
      return -1
    }
    if (nameA > nameB) {
      return 1
    }

    // names must be equal
    return 0
  })
  return copyArray
}

module.exports = { sortArrayByName }
