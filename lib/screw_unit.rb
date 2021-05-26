dir = File.dirname(__FILE__)
require "rubygems"
require "thin"
require "#{dir}/screw_unit/dispatcher"
require "#{dir}/screw_unit/server"
require "#{dir}/screw_unit/resources"
require "#{dir}/screw_unit/configuration"
require "#{dir}/screw_unit/asset_manager"
require "#{dir}/screw_unit/string_extension"
require "#{dir}/screw_unit/array_extension"
require "#{dir}/screw_unit/asset_location"
require "#{dir}/screw_unit/js_file"

module ScrewUnit
  VERSION = "1.9.0"

  dir = File.dirname(__FILE__)
  SCREW_UNIT_ROOT = File.expand_path("#{dir}/..")
end
