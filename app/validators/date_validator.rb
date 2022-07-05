class DateValidator < ActiveModel::EachValidator

    def validate_each(record, attribute, value)
  
      value = record.attributes_before_type_cast[attribute.to_s]
  
      unless value.present? || options[:blank_ok]
        record.errors.add attribute, "can't be blank"
        return
      end
  
      if value.present?
        return if value.is_a?(Date)
  
        begin
          Date.parse(value)
        rescue Date::Error
          record.errors.add attribute, "is not a valid date"
        end
      end
  
    end
  
  end