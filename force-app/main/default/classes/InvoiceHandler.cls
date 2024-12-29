public class InvoiceHandler {
	@AuraEnabled(cacheable=true)
    public static List<OpportunityLineItem> fetchLineItems(Id parentId) {
        return [
            SELECT Id, Product2.Name, Quantity, UnitPrice
            FROM OpportunityLineItem
            WHERE OpportunityId = :parentId limit 1
        ];
    }
}