require "#{File.dirname(__FILE__)}/../screw_unit_spec_helper"

describe Array do
  describe "#starts_with?" do
    it "returns true only for arrays that share a common prefix with the receiver" do
      a = ["foo", "bar", "baz"]
      a.starts_with?(["foo"]).should be_true
      a.starts_with?(["foo", "bar"]).should be_true
      a.starts_with?(["foo", "bar", "baz"]).should be_true
      a.starts_with?(["foo", "bar", "baz", "quux"]).should_not be_true
      a.starts_with?(["quux"]).should_not be_true
      a.starts_with?([]).should be_true
    end
  end
end
