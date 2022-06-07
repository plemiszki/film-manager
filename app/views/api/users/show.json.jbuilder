json.user do
  json.id @user.id
  json.name @user.name
  json.email @user.email
  json.title @user.title || ""
  json.emailSignature @user.email_signature || ""
  json.access @user.access
  json.hasAutoRenewApproval @user.has_auto_renew_approval
end
