{
  description = "Static website demo";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixpkgs-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};

        serve = pkgs.writeShellScriptBin "serve" ''
          echo "Serving site at http://localhost:8080"
          ${pkgs.python3}/bin/python3 -m http.server 8080 --directory site
        '';

        build = pkgs.writeShellScriptBin "build" ''
          echo "Nothing to build — site/ is already static HTML."
          echo "Contents:"
          ls -la site/
        '';
      in
      {
        devShells.default = pkgs.mkShell {
          packages = [
            pkgs.python3        # dev server via `python -m http.server`
            pkgs.prettier               # format HTML/CSS/JS
            pkgs.jq             # JSON wrangling
            serve               # `serve` to preview the site
            build               # `build` placeholder
          ];

          shellHook = ''
            echo "enterprise-ui dev shell"
            echo ""
            echo "  serve    — preview site at http://localhost:8080"
            echo "  prettier — format HTML/CSS/JS files"
            echo ""
          '';
        };

        packages.default = pkgs.stdenv.mkDerivation {
          pname = "enterprise-ui";
          version = "0.1.0";
          src = ./site;
          installPhase = ''
            mkdir -p $out
            cp -r . $out/
          '';
        };
      }
    );
}
