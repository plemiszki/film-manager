class Api::PurchaseOrdersController < ApplicationController

  include PurchaseOrderItems

  def index
    @purchase_orders = PurchaseOrder.all.includes(:customer)
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
    @purchase_order = PurchaseOrder.find(params[:purchase_order][:id])
    if @purchase_order.send_invoice
      number = Invoice.where(invoice_type: 'dvd').length
      invoice = Invoice.create_invoice({
        invoice_type: 'dvd',
        from: @purchase_order,
        number: "#{number + 1}D",
        sent_date: Date.today,
        po_number: @purchase_order.number,
        shipping_name: @purchase_order.name,
        shipping_address1: @purchase_order.address1,
        shipping_address2: @purchase_order.address2,
        shipping_city: @purchase_order.city,
        shipping_state: @purchase_order.state,
        shipping_zip: @purchase_order.zip,
        shipping_country: @purchase_order.country
      })
      # pathname = Rails.root.join('tmp', Time.now.to_s)
      # FileUtils.mkdir_p("#{pathname}")
      # invoice.export!(pathname)
      # mg_client = Mailgun::Client.new ENV['MAILGUN_KEY']
      # message_params =  { from: current_user.email,
      #                     to: 'plemiszki@gmail.com',
      #                     subject: "Invoice",
      #                     text: "here we go",
      #                     # attachment: attachments
      #                   }
      # mg_client.send_message 'filmmovement.com', message_params
    end
    render json: { message: 'ok' }, status: 200
  end

  private

  def purchase_order_params
    params[:purchase_order].permit(:number, :order_date, :name, :address1, :address2, :city, :state, :zip, :country, :customer_id, :shipping_address_id, :send_invoice)
  end

end
