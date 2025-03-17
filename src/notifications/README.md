# Templates and notifications

NOTE That many templates exists in user/owner pairs to allow for different communication content externally and internally.

## Interactively triggered notifications

| Templatename                                                                | Description                                                                                                                                                                                                                                                                                                                  |
| :-------------------------------------------------------------------------- | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| advert-was-reserved<br/>advert-was-reserved-owner                           | Triggered when:<br/>1. One or more items of an advert has been reserved by a user on the website                                                                                                                                                                                                                             |
| advert-reservation-was-cancelled<br/>advert-reservation-was-cancelled-owner | Triggered when:<br/>1. A user cancels their reservation on the website<br/>2. A reservation is manually cancelled by the advert owner or delegate<br/>3. A reserved item has not been collected within the number of days set by the system setting MAX_RESERVATION_DAYS and hence being released for other users to reserve |
| advert-was-collected<br/>advert-was-collected-owner                         | Triggered when:<br/>1. A user collects a reserved item using QR-code scanning<br/>2. A reservation has been collected manually by the advert owner or delegate                                                                                                                                                               |
| advert-collect-was-cancelled<br/>advert-collect-was-cancelled-owner         | Triggered when:<br/>1. A collected item has been returned manually by the advert owner or delegate                                                                                                                                                                                                                           |
| advert-was-returned<br/>advert-was-returned-owner                           | Triggered when:<br/>1. A collected item has been returned by using QR-code scanning by the advert owner or delegate                                                                                                                                                                                                          |
| advert-was-picked<br/>advert-was-picked-owner                               | Triggered when:<br/>1. The advert owner or delegate changes the status of the advert manually to picked                                                                                                                                                                                                                      |
| advert-was-unpicked-owner                                                   | Triggered when:<br/>1. The advert owner or delegate changes the status of the advert manually to unpicked                                                                                                                                                                                                                    |
| advert-collect-was-renewed<br/> advert-collect-was-renewed-owner            | Triggered when:<br/>1. The advert owner or delegate prolongs the loan period of a collected item (Only applicable for lending adverts)                                                                                                                                                                                       |
| advert-reservation-was-renewed<br/>advert-reservation-was-renewed-owner     | Triggered when:<br/>1. The advert owner or delegate prolongs a reservation period of a reserved item                                                                                                                                                                                                                         |
| pincode-requested                                                           | Triggered when:<br/>1. A user requests to be authenticated by the system                                                                                                                                                                                                                                                     |

## System triggered notifications

| Templatename                  | Description                                                                                                                                                                                                                                                                                                                                                                                                                                                 |
| :---------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| advert-not-collected          | Triggered when:<br/>1. A reserved item has not been collected.<br/><br/>This is a reminder sent repeatably given the frequency set by the system setting REMINDER_FREQUENCY_DAYS.<br/>The timing of the first reminder is influenced by the system setting REMINDER_SNOOZE_UNTIL_PICKED. If set, the first reminder is sent after REMINDER_FREQUENCY_DAYS has passed since the item was picked. Otherwise, the date of the reservation is used as reference |
| advert-not-returned           | Triggered when:<br/>1. A collected item has not been returned at the end of a lending period.<br/><br/>This is a reminder sent repeatably given the frequency set by the system setting REMINDER_FREQUENCY_DAYS. (Only applicable for lending adverts)                                                                                                                                                                                                      |
| advert-waitlist-available     | Triggered when:<br/>1. A reserved or collected item has become available due to return or cancellation.                                                                                                                                                                                                                                                                                                                                                     |
| subscriptions-has-new-adverts | Triggered when:<br/>1. A new advert matching the subscribed pattern has become available                                                                                                                                                                                                                                                                                                                                                                    |

# Template data object

Access the data object using dot notation with advert as the root element.
e.g "advert.createdBy"

| Name                 | Typ      | Description                                                                                |
| :------------------- | :------- | :----------------------------------------------------------------------------------------- |
| id                   | String   | The unqique id of the advert                                                               |
| versionId            | String   | The unique id of the current version of the advert                                         |
| createdBy            | String   | The owner of the advert                                                                    |
| createdAt            | String   | The creation date of the advert                                                            |
| modifiedAt           | String   | The last modification date of the advert                                                   |
| archivedAt           | String   | The archivation date of the advert (if archived)                                           |
| pickedAt             | String   | The picked date of the advert (if picked)                                                  |
| reservedAt           | String   | The last reservation date of the advert (historically)                                     |
| collectedAt          | String   | The last collection date of the advert (historically)                                      |
| returnedAt           | String   | The last date the item of the advert was returned                                          |
| title                | String   | The title of the advert                                                                    |
| description          | String   | The description of the advert                                                              |
| quantity             | Number   | The quantity available of the advert                                                       |
| lendingPeriod        | Number   | The number of days an item of an advert can be borrowed (If lending advert)                |
| unit                 | String   | The unit of measurement of the item                                                        |
| width                | String   | The width of the item                                                                      |
| height               | String   | The height of the item                                                                     |
| depth                | String   | The depth of the item                                                                      |
| weight               | String   | The weight of the item                                                                     |
| size                 | String   | The size of the item                                                                       |
| material             | String   | The material of the item                                                                   |
| condition            | String   | The condition of the item                                                                  |
| usage                | String   | The usage of the item                                                                      |
| category             | String   | The category name the advert belongs to                                                    |
| reference            | String   | The internal reference id of the advert                                                    |
| externalId           | String   | The external id of the item                                                                |
| notes                | String   | The private notes of the item                                                              |
| tags                 | String[] | The tags assigned to the advert                                                            |
| place                | String   | The place where the item is housed                                                         |
| location.name        | String   | The name of the location (or chosen pickup location when applicable)                       |
| location.adress      | String   | The address of the location (or chosen pickup location when applicable)                    |
| location.zipCode     | String   | The zipcode of the location (or chosen pickup location when applicable)                    |
| location.country     | String   | The country code of the location (or chosen pickup location when applicable)               |
| contact.email        | String   | The email of the contact (or contact of the chosen pickup location when applicable)        |
| contact.phone        | String   | The phonenumber of the contact (or contact of the chosen pickup location when applicable)  |
| contact.organization | String   | The organisation of the contact (or contact of the chosen pickup location when applicable) |
