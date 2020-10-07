module.exports = function(grunt) {

  grunt.initConfig({

    clean: ["web/assets", "var/cache/grunt", "src/Afup/BarometreBundle/Resources/assets/sass/vendor/"],

    copy: {
      main: {
        files: [
          {expand: true, cwd: 'node_modules/tarteaucitronjs/', src: ['*.js', 'lang/tarteaucitron.fr.js'], dest: 'web/js/tarteaucitron/'},
        ]
      }
    }
})};
