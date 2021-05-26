module ScrewUnit
  class Dispatcher
    attr_reader :root, :resource_locators

    def initialize(configuration)
      @resource_locators = configuration.resource_locators
      @root = Resources::Root.new(configuration)
    end

    def call(env)
      request = Rack::Request.new(env)
      resource = locate_resource(request.path_info)
      case(request.request_method)
      when "GET"
        resource.get
      when "POST"
        resource.post(request)
      else
        raise "unrecognized HTTP method #{request.request_method}"
      end
    rescue Exception => e
      puts e.message
      puts e.backtrace
    end

    def locate_resource(path)
      resource_locators.each do |locator|
        resource = locator.locate_resource(path)
        return resource if resource
      end

      path_parts(path).inject(root) do |resource, child_resource_name|
        resource.locate(child_resource_name)
      end
    end

    def path_parts(path)
      path.split('/').reject { |part| part == "" }
    end
  end
end
