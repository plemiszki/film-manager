class Api::PurchaseOrdersController < AdminController

  include PurchaseOrderItems

  def index
    @purchase_orders = PurchaseOrder.all.includes(:customer, :purchase_order_items).order('ship_date DESC')
    @purchase_orders = @purchase_orders.limit(25) unless params[:all]
    @shipping_addresses = ShippingAddress.all
    @jobs = Job.where(name: "import inventory").order(:id)
    render "index.json.jbuilder"
  end

  def show
    @purchase_orders = PurchaseOrder.where(id: params[:id])
    @shipping_addresses = ShippingAddress.all
    get_data_for_items
    render "show.json.jbuilder"
  end

  def create
    params = purchase_order_params
    if params[:shipping_address_id] && params[:shipping_address_id] != ''
      shipping_address = ShippingAddress.find(params[:shipping_address_id].to_i)
      params[:name] = shipping_address.name
      params[:address1] = shipping_address.address1
      params[:address2] = shipping_address.address2
      params[:city] = shipping_address.city
      params[:state] = shipping_address.state
      params[:zip] = shipping_address.zip
      params[:country] = shipping_address.country
      params[:customer_id] = shipping_address.customer_id
      if (params[:customer_id] > 0 && DvdCustomer.find(params[:customer_id]).consignment == false)
        params[:send_invoice] = true
      else
        params[:send_invoice] = false
      end
    else
      params[:send_invoice] = false
    end
    params.delete(:shipping_address_id)
    @purchase_order = PurchaseOrder.new(params)
    if @purchase_order.save
      render "create.json.jbuilder"
    else
      render json: @purchase_order.errors.full_messages, status: 422
    end
  end

  def update
    @purchase_order = PurchaseOrder.find(params[:id])
    if @purchase_order.update(purchase_order_params)
      @purchase_orders = PurchaseOrder.where(id: params[:id])
      @shipping_addresses = ShippingAddress.all
      get_data_for_items
      render "show.json.jbuilder"
    else
      render json: @purchase_order.errors.full_messages, status: 422
    end
  end

  def destroy
    @purchase_order = PurchaseOrder.find(params[:id])
    if @purchase_order.destroy
      render json: @purchase_order, status: 200
    else
      render json: @purchase_order.errors.full_messages, status: 422
    end
  end

  def ship
    SendDvdPoAndInvoice.perform_async(params[:purchase_order][:id], current_user.id, params[:reporting_only])
    render json: { message: 'ok' }, status: 200
  end

  def reporting
    @sales = {}
    month_totals = Hash.new(0)
    @dvd_customers = DvdCustomer.all.order(:name)
    @dvd_customers.each_with_index do |dvd_customer, index|
      next if dvd_customer.id == 33 # do not include Unobstructed View
      months = {}
      total = 0
      1.upto(12) do |month|
        if dvd_customer.consignment
          pos = PurchaseOrder.where(customer_id: dvd_customer.id, month: month, year: params[:year]).includes(:purchase_order_items).select { |po| po.ship_date != nil }
          sales = 0
          pos.each do |po|
            po.purchase_order_items.each do |item|
              sales += (Invoice.get_item_price(item.item_id, item.item_type, dvd_customer).to_f * item.qty)
            end
          end
        else
          sales = PurchaseOrder.where(customer_id: dvd_customer.id, month: month, year: params[:year]).includes(:invoice).select { |po| po.ship_date != nil }.map { |po| po.invoice }.reduce(0) { |total, invoice| total += (invoice ? invoice.total : 0) }
        end
        returns = Return.where(customer_id: dvd_customer.id, month: month, year: params[:year]).includes(:return_items).map { |r| r.return_items }.flatten.reduce(0) { |total, item| total += item.amount }
        difference = sales - returns
        total += difference
        month_totals[month] += difference
        months[month] = difference
      end
      months[:total] = total
      @sales[dvd_customer.id] = months
      @sales[:month_totals] = month_totals
      @sales[:year_total] = month_totals.values.reduce(:+)
    end
    @dvds = Dvd.where(retail_date: (DateTime.parse("1/1/#{params[:year]}"))..DateTime.parse("31/12/#{params[:year]}")).includes(:dvd_type).includes(:feature).order(:retail_date)
    @dvd_units = Hash.new { |hash, key| hash[key] = {} }
    @dvd_sales = Hash.new { |hash, key| hash[key] = {} }
    @dvds.each do |dvd|
      { amazon: 8, aec: 1, baker: 3, ingram: 4, midwest: 2 }.each do |key, value|
        units = PurchaseOrderItem.where(item_id: dvd.id, item_type: "dvd").includes(:purchase_order).select { |item| item.purchase_order.customer_id == value && item.purchase_order.ship_date }.reduce(0) { |total, item| total += item.qty }
        returned_units = ReturnItem.where(item_id: dvd.id, item_type: "dvd").includes(:return).select { |item| item.return.customer_id == value }.reduce(0) { |total, item| total += item.qty }
        units -= returned_units
        @dvd_units[dvd.id][key] = units
        sales = units * Invoice.get_item_price(dvd.id, 'dvd', DvdCustomer.find(value), dvd).to_f
        @dvd_sales[dvd.id][key] = sales
      end
      all_rows = PurchaseOrderItem.where(item_id: dvd.id, item_type: "dvd").includes(purchase_order: :customer).select { |item| po = item.purchase_order; po.ship_date && po.customer_id != 0 }
      all_return_rows = ReturnItem.where(item_id: dvd.id, item_type: "dvd").includes(return: :customer)
      @dvd_units[dvd.id][:total_units] = (all_rows.reduce(0) { |total, item| total += item.qty } - all_return_rows.reduce(0) { |total, item| total += item.qty } )
      total_sales = 0.0
      all_rows.each do |row|
        total_sales += row.qty * Invoice.get_item_price(dvd.id, 'dvd', row.purchase_order.customer, dvd).to_f
      end
      all_return_rows.each do |row|
        total_sales -= row.qty * Invoice.get_item_price(dvd.id, 'dvd', row.return.customer, dvd).to_f
      end
      @dvd_sales[dvd.id][:total_sales] = total_sales
    end
    render "reporting.json.jbuilder"
  end

  def export
    start_date = Date.strptime(params[:start_date], "%m/%d/%y")
    end_date = Date.strptime(params[:end_date], "%m/%d/%y")
    time_started = Time.now.to_s
    total_pos = PurchaseOrder.where(order_date: start_date..end_date).count
    job = Job.create!(job_id: time_started, name: "export dvd sales", first_line: "Exporting DVD Sales", second_line: true, current_value: 0, total_value: total_pos)
    ExportDvdSales.perform_async(time_started, start_date, end_date)
    render json: job
  end

  private

  def purchase_order_params
    params[:purchase_order].permit(:number, :order_date, :name, :address1, :address2, :city, :state, :zip, :country, :customer_id, :shipping_address_id, :send_invoice, :notes, :month, :year)
  end

end
