(function() {
    'use strict';
    
    var text = document.getElementById('input'),
        parse = document.getElementById('parse'),
        targets = document.getElementById('targets'),
        styles, selectors, properties;
    
    Array.prototype.trim = function() {
        for( var i = 0; i < this.length; i++ ) {
            if( this[i].match(/^\s*$/g) ) {
                delete this[i];
                this.length = this.length -1;
            } else {
                this[i] = this[i].trim();
            }
        }
        return this;
    }
    
    if ( typeof String.prototype.endsWith !== 'function' ) {
        String.prototype.endsWith = function(suffix) {
            return this.indexOf(suffix, this.length - suffix.length) !== -1;
        };
    }
    
    Array.prototype.joint = function(arg) {
        var arr = [], i;
        for( i = 0; i < this.length; i++ ) {
            if( typeof this[i] !== 'undefined' ) {
                arr.push(this[i]);
            }
        }
        return arr.join(arg);
    }
    
    function formatComment( inp ) {
        if( /(\*\*)|(\*\s\*)/.test(inp) ) {
            inp = inp.replace( /(\*\*)|(\*\s\*)/, '*\n *' );
            inp = inp.replace( /\*\//, '\n */' );
        }
        return inp;
    }
    
    function parseMyCss( css, targs ) {
        
        var found = {}, targetChunks = {}, seperated = {};
        
        styles = css.replace(/(\r\n|\n|\r)/gm,'').split('}');
        targs = targs.replace(/(\r\n|\n|\r)/gm,'').split(';');
        
        for( var i = 0; i < styles.length; i++ ) {
            found[i] = {};
            var tempStyle = styles[i].split('{');
            found[i].selectors = tempStyle[0].split(',').trim();
            found[i].props = tempStyle[1];
        }
        
        for( var n in found ) {
            if( typeof found[n].props !== 'undefined' ) {
                found[n].props = found[n].props.toLowerCase().split(';').trim();
            } else {
                delete found[n];
            }
        }
        
        for( var x = 0; x < targs.length - 1; x++ ) {
            targetChunks[x] = {};
            seperated[x] = {};
            if( targs[x] !== '' ) {
                var tempChunks = targs[x].split(':');
                targetChunks[x].prop = tempChunks[0].trim();
                targetChunks[x].val = tempChunks[1].trim();
                
                seperated[x].selectors = [];
                seperated[x].prop = targetChunks[x].prop;
                seperated[x].val = targetChunks[x].val;
                
                for( var y in found ) {
                    for( var z = 0; z < found[y].props.length; z++ ) {
                        var str = '';
                        str += found[y].props[z];
                        if( str.match(targetChunks[x].prop) && str.match(targetChunks[x].val) ) {
                            seperated[x].selectors.push(found[y].selectors.join(', '));
                            delete found[y].props[z];
                        }
                    }
                }
                
            }
        }
        
        var sepStrs = {}, unsepStrs = '';
        
        for( var p in seperated ) {
            var returnStr = '',
                selectorStr = seperated[p].selectors.join(', ') + ' {\n';
            
            if( /\*\//.test( selectorStr ) ) {
                returnStr += selectorStr.split('*/')[1];
            } else {
                returnStr += selectorStr;
            }
            
            returnStr += '\t';
            returnStr += seperated[p].prop + ': ' + seperated[p].val + ';';
            returnStr += '\n}';
            sepStrs[p] = returnStr;
        }
        
        for( var q in found ) {
            if( typeof found[q].props !== 'undefined' && typeof found[q].selectors !== 'undefined' && found[q].props != '' ) {
                
                var returnStr = '',
                    selectorStr = found[q].selectors.join(',\n') + ' {\n\t';
                if( /\*\//.test( selectorStr ) ) {
                    returnStr += formatComment( selectorStr.split('*/')[0] + '*/' );
                    returnStr += '\n';
                    returnStr += selectorStr.split('*/')[1];
                } else {
                    returnStr += selectorStr;
                }
                
                returnStr += found[q].props.joint(';\n\t') + ';';
                returnStr += '\n}';
                if( q !== Object.keys(found).length ) {
                    returnStr += '\n\n';
                }
                unsepStrs += returnStr;
            }
        }
        
        var returnObject = {
            seperated: sepStrs,
            unseperated: unsepStrs
        };
        
        return returnObject;
    }
    
    parse.onclick = function() {
        var targetStrs = '' + targets.value.toLowerCase(),
            strs = parseMyCss( text.value, ( targetStrs.endsWith(';') ? targetStrs : targetStrs + ';' ) ),
            sepView = document.getElementById('seperated'),
            unsepView = document.getElementById('unseperated'),
            sepstr;
        sepstr = '';
        for( var m in strs.seperated ) {
            sepstr += '<pre>';
            sepstr += strs.seperated[m];
            sepstr += '</pre>';
        }
        sepView.innerHTML = sepstr;
        unsepView.innerHTML = '<pre>' + strs.unseperated + '</pre>';
    };
    
    document.querySelector('.help-bar .bar').onclick = function() {
        document.querySelector('.help-bar').classList.toggle('opened');
    }
    
})();