// contains all scripts which shall be executed to migrate to tool version 2.0.0
// each module has to return a result object holding the modified item and a
// flag property indicating if item was changed or not
module.exports.migrate = function(item) {
  let result = {
    isChanged: false
  }
  if (item.parties) {
    let truthyparties = item.parties.filter(party => {
      return party.name !== undefined && party.name !== '';
    });
    if (truthyparties.length < item.parties.length) {
      item.parties = truthyparties;
      result.isChanged = true;
    } 
  }
  result.item = item;
  return result;
}
