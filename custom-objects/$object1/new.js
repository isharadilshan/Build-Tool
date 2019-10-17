Facade.Behaviors.Page.onLoad(function () {
    questionnairePoolQuery.onSuccess(function (results) {
        var filteredList = results.transformList({
            filter: function (item) {
                if (
                    item.get("versionState") ==
                    QUESTIONNAIRE_TEMPLATE.VERSION_STATE.PUBLISHED.value
                )
                    return false;
                else return true;
            }
        });

        Facade.DataRegistry.deregister("questionnaireList");
        Facade.DataRegistry.register("questionnaireList", filteredList);
    });
    templateDesign = Facade.DesignRegistry.get(DESIGN.QUESTIONNAIRE)
        .get("design")
        .get("fieldData");

    let picklistOperatorPicklist = Facade.PicklistRegistry.get(
        "core.filters.operator.PICKLIST"
    );
    picklistOperatorPicklist.push(
        new Facade.Prototypes.Data({
            value: Facade.Constants.Operator.NOT_IN,
            label: `not in ${QUESTIONNAIRE_TEMPLATES.VERSION_STATES.PUBLISH.value}`//what is the meaning
        })
    );
});

var usrName = userName;

signInOut();