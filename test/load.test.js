
var expect = require('expect.js')
  , mock = require('../mock')
  , expected = mock.expected
  , opencontrol         // system under test
  ;

before(function (done) { mock.preflight(done); });
before(function () { opencontrol = require('../lib/opencontrol'); });

describe('Loader', function () {
    var db;

    it('should work', function (done) {
        opencontrol.load(mock.config, function (err, _db) {
            db = _db;
            done(err, db);
        });
    });

    it('should return a database', function () {
        expect(db).to.be.ok();
        expect(db).to.be.an(opencontrol.Database);
    });

    describe('Controls', function () {

    it('should load all controls', function () {
        expected.controls.forEach(key =>
            expect(db.controls.chain().find({ key: key }).value()).to.be.ok());
    });
    it('should add "key" and "standard_key" properties', function () {
        db.controls.records.forEach(control => {
            expect(control).to.have.property('standard_key');
            expect(control).to.have.property('key');
        });
    });
    it('should not have any unexpected controls', function () {
        expect(db.controls.records.length)
              .to.equal(expected.controls.length);
    });

    });

    describe('Components', function () {
    it('should load all components', function () {
        expected.components.forEach(key =>
            expect(db.components.chain().find({ key: key }).value()).to.be.ok());
    });
    it('should add "key" property to all loaded components', function () {
        db.components.records.forEach(component =>
            expect(component).to.have.property('key'));
    });
    it('should not have any unexpected components', function () {
        expect(db.components.records.length)
              .to.equal(expected.components.length);
    });
    });

    describe('Certifications', function () {

    it('are stored as a flat table', function () {
        expect(db.certifications.records.length)
            .to.eql(expected.certified.length);
        for (var c of db.certifications.records) {
            expect(c).to.have.property('certification');
            expect(c).to.have.property('standard_key');
            expect(c).to.have.property('certification');
        }
    });

    });

    describe('Pages', function () {

        it('should load markdown pages', function () {
            expect(db.pages.records.length).to.equal(5);
        });

        it('... identified by relative pathname', function () {
            var readme = db.pages.chain()
                .find({ relative: 'README.md' }).value();
            expect(readme).to.be.ok();
        });

        it('parses YAML frontmatter in *.md files', function () {
            var readme = db.pages.chain()
                .find({ relative: 'README.md' }).value();
            expect(readme).to.have.property('data');
            expect(readme).to.have.property('html');
            expect(readme.data).to.have.property('title');
            expect(readme.data).to.have.property('date');
            // make sure YAML parser doesn't do anything funky with datestamps:
            expect(readme.data.date).to.be.a('string');
        });

        it('sub/dir/README.md renamed to sub/dir', function () {
            var moda = db.pages.findByKey('modules/moda')
              , modb = db.pages.findByKey('modules/modb')
              ;
            expect(moda).to.have.property('html');
            expect(modb).to.have.property('html');
        });

        it('pages can also be components', function () {
            var moda = db.components.findByKey('moda')
              , modb = db.components.findByKey('modb')
              ;
            expect(moda).to.be.ok();
            expect(modb).to.be.ok();
        });

    });

});
