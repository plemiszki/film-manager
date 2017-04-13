module ApplicationHelper

  def dollarify(input)
    if (input[0] == "-")
      '-$' + input[1..-1]
    else
      '$' + input
    end
  end

end
