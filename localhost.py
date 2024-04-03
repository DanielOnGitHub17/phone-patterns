from http.server import *
def start_host(port=8000, path='', server_class=HTTPServer, handler_class=CGIHTTPRequestHandler):
    server_address = (path, port)
    httpd = server_class(server_address, handler_class)
    httpd.serve_forever()
    
import sys
if __name__=='__main__':
    args = sys.argv
    start_host(int(args[1]) if len(args)-1 else int(input("port: ")),
              args[2] if len(args)>2 else '')
