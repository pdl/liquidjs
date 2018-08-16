const chai = require('chai')
const sinon = require('sinon')
const sinonChai = require('sinon-chai')
const expect = chai.expect

chai.use(sinonChai)

let filter = require('../src/filter.js')()
let Scope = require('../src/scope.js')

describe('filter', function () {
  let scope
  beforeEach(function () {
    filter.clear()
    scope = Scope.factory()
  })
  it('should return default filter when not registered', function () {
    let result = filter.construct('foo')
    expect(result.name).to.equal('foo')
  })

  it('should throw when filter name illegal', function () {
    expect(function () {
      filter.construct('/')
    }).to.throw(/illegal filter/)
  })

  it('should parse argument syntax', function () {
    filter.register('foo', x => x)
    let f = filter.construct('foo: a, "b"')

    expect(f.name).to.equal('foo')
    expect(f.args).to.deep.equal(['a', '"b"'])
  })

  it('should register a simple filter', function () {
    filter.register('upcase', x => x.toUpperCase())
    expect(filter.construct('upcase').render('foo', scope)).to.equal('FOO')
  })

  it('should register a argumented filter', function () {
    filter.register('add', (a, b) => a + b)
    expect(filter.construct('add: 2').render(3, scope)).to.equal(5)
  })

  it('should register a multi-argumented filter', function () {
    filter.register('add', (a, b, c) => a + b + c)
    expect(filter.construct('add: 2, "c"').render(3, scope)).to.equal('5c')
  })

  it('should call filter with corrct arguments', function () {
    let spy = sinon.spy()
    filter.register('foo', spy)
    filter.construct('foo: 33').render('foo', scope)
    expect(spy).to.have.been.calledWith('foo', 33)
  })

  it('should support arguments as named key/values', function () {
    filter.register('foo', x => x)
    let f = filter.construct('foo: key1: "literal1", key2: value2')
    expect(f.name).to.equal('foo')
    expect(f.args).to.deep.equal([ '\'key1\'', '"literal1"', '\'key2\'', 'value2' ])
  })

  it('should support arguments as named key/values with inline literals', function () {
    filter.register('foo', x => x)
    let f = filter.construct('foo: "test0", key1: "literal1", key2: value2')
    expect(f.name).to.equal('foo')
    expect(f.args).to.deep.equal([ '"test0"', '\'key1\'', '"literal1"', '\'key2\'', 'value2' ])
  })

  it('should support arguments as named key/values with inline values', function () {
    filter.register('foo', x => x)
    let f = filter.construct('foo: test0, key1: "literal1", key2: value2')
    expect(f.name).to.equal('foo')
    expect(f.args).to.deep.equal([ 'test0', '\'key1\'', '"literal1"', '\'key2\'', 'value2' ])
  })

  it('should support argument values named same as keys', function () {
    filter.register('foo', x => x)
    let f = filter.construct('foo: a: a')
    expect(f.name).to.equal('foo')
    expect(f.args).to.deep.equal(['\'a\'', 'a'])
  })

  it('should support argument literals named same as keys', function () {
    filter.register('foo', x => x)
    let f = filter.construct('foo: a: "a"')
    expect(f.name).to.equal('foo')
    expect(f.args).to.deep.equal(['\'a\'', '"a"'])
  })
})
