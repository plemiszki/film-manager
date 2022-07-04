class DateValidator < ActiveModel::EachValidator

    def validate_each(record, attribute, value)
  
      value = record.attributes_before_type_cast[attribute.to_s]
  
      unless value.present? || options[:blank_ok]
        record.errors.add attribute, "can't be blank"
        return
      end
  
      if value.present?
        return if value.is_a?(Date)
        match_data = value.match(/(?<month>\d{1,2})\/(?<day>\d{1,2})\/(?<year>\d{1,4})/)
        match_data ||= value.match(/(?<year>\d{1,4})-(?<month>\d{1,2})-(?<day>\d{1,2})/)
        if match_data.nil?
          record.errors.add attribute, "is not a valid date"
          return
        end
  
        begin
          Date.parse("#{match_data[:year]}/#{match_data[:month]}/#{match_data[:day]}")
        rescue Date::Error
          record.errors.add attribute, "is not a valid date"
        end
      end
  
    end
  
  end