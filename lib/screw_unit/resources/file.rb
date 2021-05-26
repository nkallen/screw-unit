module ScrewUnit
  module Resources
    class File
      attr_reader :virtual_path, :asset_manager
      def initialize(virtual_path, asset_manager)
        @virtual_path, @asset_manager = virtual_path, asset_manager
      end

      def physical_path
        asset_manager.physicalize_path(virtual_path)
      end

      def get
        [200, headers, ::File.read(physical_path)]
      end

      MIME_TYPES = {
        ".css" => "text/css",
        ".gif" => "image/gif",
        ".js" => "application/javascript",
        ".jpg" => "image/jpeg",
        ".jpeg" => "image/jpeg",
        ".png" => "image/png",
        }

      def headers
        {
          "Content-Type" => mime_type(physical_path),
          "Last-Modified" => ::File.mtime(physical_path).httpdate
        }
      end

      protected

      def mime_type(physical_path)
        MIME_TYPES[::File.extname(physical_path)]
      end
    end
  end
end
