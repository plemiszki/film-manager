json.array! @sublicensors do |sublicensor|
  json.id sublicensor.id
  json.name sublicensor.name
  json.email sublicensor.email || ""
  json.phone sublicensor.phone || ""
  json.contactName sublicensor.contact_name || ""
  json.w8 sublicensor.w8 == true ? "yes" : "no"
end
