module AwsUpload

  extend ActiveSupport::Concern

  def upload_to_aws(file:, key:)
      s3_client = Aws::S3::Client.new(
      credentials: Aws::Credentials.new(ENV['AWS_ACCESS_KEY_ID'], ENV['AWS_SECRET_ACCESS_KEY']),
      region: 'us-east-1',
      ssl_verify_peer: true,
      ssl_ca_store: OpenSSL::X509::Store.new.tap { |store|
        store.set_default_paths
        # macOS/Homebrew OpenSSL lacks CRLs, so skip CRL/OCSP check safely
        store.flags = OpenSSL::X509::V_FLAG_NO_CHECK_TIME
      }
    )
    transfer_manager = Aws::S3::TransferManager.new(client: s3_client)

    bucket_name = ENV['S3_BUCKET']

    transfer_manager.upload_file(
      file.path,
      bucket: bucket_name,
      key: key,
      acl: 'public-read'
    )

    return "https://#{bucket_name}.s3.us-east-1.amazonaws.com/#{key}"
  end

end
