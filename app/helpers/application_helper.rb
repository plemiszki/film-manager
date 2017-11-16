module ApplicationHelper

  def dollarify(input)
    input << "0" if input.split('.')[1].length < 2
    if (input[0] == "-")
      '-$' + input[1..-1]
    else
      '$' + input
    end
  end

  def get_price(id, type, dvd_customer_id)
    return dollarify(@selected_dvd_customer.per_unit.to_s) if @selected_dvd_customer.per_unit
    if type == "dvd"
      item = Dvd.find(id)
      price = item.price
    elsif type == "giftbox"
      item = Giftbox.find(id)
      price = item.msrp
    end
    dollarify((price * ((100 - @selected_dvd_customer.discount) / 100)).floor(2).to_s)
  end

end
