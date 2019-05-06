json.user do
  json.id @user.id
  json.name @user.name
  json.email @user.email
  json.title @user.title || ""
  json.emailSignature @user.email_signature || ""
end
