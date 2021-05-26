module ScrewUnit
  module Resources
    class FileNotFound
      attr_reader :virtual_path

      def initialize(virtual_path)
        @virtual_path = virtual_path
      end

      def locate(name)
        self
      end
      
      def get
        puts "Couldn't find #{virtual_path}"
        [404, {}, "No file found at relative path '#{virtual_path}'"]
      end

      def error
        raise 
      end
    end
  end
end
