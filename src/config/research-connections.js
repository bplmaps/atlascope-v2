export const bboxFunctions = [
    {
        "name": "Search more maps here",
        "searchFunction": function (bbox) { return `https://collections.leventhalmap.org/search?q=&utf8=✓&view=split&bbox=${bbox.join('%20')}` },
        "hiddenOnMobile": false
    }
    ,

    {
        "name": "Search photographs here",
        "searchFunction": function (bbox) { return `https://www.digitalcommonwealth.org/search?coordinates=%5B${bbox[1]}%2C${bbox[0]}%20TO%20${bbox[3]}%2C${bbox[2]}%5D&spatial_search_type=bbox&view=gallery&f%5Bgenre_basic_ssim%5D%5B%5D=Photographs` },
        "hiddenOnMobile": false
    },

    {
        "name": "Search parcels in MassMapper",
        "searchFunction": function (bbox) { return `https://maps.massgis.digital.mass.gov/MassMapper/MassMapper.html?bl=MassGIS%20Basemap__100&l=Basemaps_L3Parcels____ON__100&b=${bbox.join(',')}` },
        "hiddenOnMobile": true
    }
]